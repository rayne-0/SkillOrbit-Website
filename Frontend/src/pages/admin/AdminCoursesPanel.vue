<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-heading text-xl font-bold text-gray-900 dark:text-white">
        {{ view === 'list' ? 'Courses Library' : form.id ? `Edit: ${form.title}` : 'Create New Course' }}
      </h2>
      <div class="flex gap-3">
        <template v-if="view === 'edit'">
          <button @click="view = 'list'" class="btn-ghost text-sm">Cancel</button>
          <button @click="save" :disabled="saving" class="btn-primary text-sm">{{ saving ? 'Saving…' : '💾 Save Course' }}</button>
        </template>
        <button v-else @click="newCourse" class="btn-primary text-sm">+ New Course</button>
      </div>
    </div>
    <div v-if="error" class="bg-danger-light border border-danger/30 text-danger rounded-xl p-3 text-sm mb-4">{{ error }}</div>

    <!-- List -->
    <div v-if="view === 'list'" class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-white/5">
          <tr><th v-for="h in ['Course','Instructor','Level','Price','Modules','Actions']" :key="h"
            class="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider" :class="h==='Actions'?'text-right':''">{{ h }}</th></tr>
        </thead>
        <tbody>
          <tr v-if="!courses.length"><td colspan="6" class="px-5 py-12 text-center text-gray-400">No courses yet. Create your first one!</td></tr>
          <tr v-for="c in courses" :key="c.id" class="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td class="px-5 py-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0 overflow-hidden">
                  <img v-if="c.thumbnail?.startsWith('http')" :src="c.thumbnail" class="w-full h-full object-cover rounded-xl" />
                  <span v-else>🎓</span>
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-gray-900 dark:text-white text-sm truncate">{{ c.title }}</div>
                  <div class="text-xs text-gray-400">{{ c.category }}</div>
                </div>
              </div>
            </td>
            <td class="px-5 py-3 text-gray-500 text-sm">{{ c.instructor }}</td>
            <td class="px-5 py-3"><span class="badge-primary">{{ c.level }}</span></td>
            <td class="px-5 py-3 font-semibold text-sm" :class="String(c.price).toLowerCase()==='free'?'text-green-500':'text-gray-900 dark:text-white'">{{ String(c.price).toLowerCase()==='free'?'Free':`₹${c.price}` }}</td>
            <td class="px-5 py-3 text-sm text-gray-500">{{ c.modules?.length || 0 }}</td>
            <td class="px-5 py-3 text-right">
              <button @click="editCourse(c)" class="btn-ghost text-xs py-1.5 mr-2">Edit</button>
              <button @click="del(c.id)" class="text-xs text-danger hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Editor -->
    <div v-if="view === 'edit'" class="space-y-6">
      <!-- Basic info -->
      <div class="card p-6">
        <h3 class="font-heading font-bold text-gray-900 dark:text-white mb-5">Course Details</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Course Title *</label>
            <input v-model="form.title" class="input" placeholder="e.g. Complete Python Bootcamp" />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
            <textarea v-model="form.description" rows="3" class="input resize-none" placeholder="What will students learn?" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Instructor</label>
            <input v-model="form.instructor" class="input" placeholder="Full name" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Category</label>
            <input v-model="form.category" class="input" placeholder="e.g. Programming" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Level</label>
            <select v-model="form.level" class="input">
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All Levels</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Duration</label>
            <input v-model="form.duration" class="input" placeholder="e.g. 10.5 hours" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Price (₹ or "Free")</label>
            <input v-model="form.price" class="input" placeholder="Free or 1499" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Thumbnail URL</label>
            <input v-model="form.thumbnail" type="url" class="input" placeholder="https://…" />
          </div>
        </div>
      </div>

      <!-- Curriculum builder -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-heading font-bold text-gray-900 dark:text-white">Curriculum</h3>
          <button @click="addModule" class="btn-outline text-xs py-1.5">+ Add Module</button>
        </div>
        <div v-if="!(form.modules?.length)" class="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
          <p class="text-sm">No modules yet. Click <strong>+ Add Module</strong> to build the course structure.</p>
        </div>
        <div v-for="(mod, mi) in form.modules" :key="mi" class="border border-gray-200 dark:border-white/10 rounded-xl mb-4 overflow-hidden">
          <!-- Module header -->
          <div class="flex items-center gap-3 bg-gray-50 dark:bg-white/5 px-4 py-3 border-b border-gray-200 dark:border-white/10">
            <span class="text-xs font-bold text-gray-500 shrink-0">MOD {{ mi + 1 }}</span>
            <input v-model="mod.title" class="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-white outline-none placeholder-gray-400" :placeholder="`Module ${mi + 1} title…`" />
            <button @click="removeModule(mi)" class="text-gray-400 hover:text-danger transition-colors text-lg shrink-0">×</button>
          </div>
          <!-- Lessons -->
          <div class="p-3 space-y-2">
            <div v-for="(ls, li) in mod.lessons" :key="li" class="bg-gray-50 dark:bg-white/5 rounded-xl overflow-hidden">
              <!-- Lesson row -->
              <div class="flex items-center gap-2 p-3">
                <select v-model="ls.type" @change="onTypeChange(ls)" class="text-xs border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 bg-white dark:bg-surface-900 outline-none shrink-0">
                  <option value="video">▶ Video</option>
                  <option value="article">📄 Article</option>
                  <option value="quiz">📝 Quiz</option>
                  <option value="assignment">📋 Assignment</option>
                </select>
                <input v-model="ls.title" class="flex-1 text-xs bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 outline-none" placeholder="Lesson title…" />
                <input v-model="ls.duration" class="w-14 text-xs bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 outline-none" placeholder="10m" />
                <button @click="toggleLesson(mi, li)" class="text-xs text-primary hover:underline shrink-0">{{ expandedLesson === `${mi}-${li}` ? '▲' : '▼' }}</button>
                <button @click="removeLesson(mi, li)" class="text-gray-400 hover:text-danger text-base shrink-0">×</button>
              </div>
              <!-- Lesson detail -->
              <div v-if="expandedLesson === `${mi}-${li}`" class="border-t border-gray-200 dark:border-white/10 p-3 space-y-3">
                <!-- Video URL -->
                <div v-if="ls.type === 'video'">
                  <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Video URL</label>
                  <input v-model="ls.video_url" type="url" class="input text-xs" placeholder="https://… (mp4, youtube embed, vimeo, etc.)" />
                </div>
                <!-- Article content -->
                <div v-if="ls.type === 'article'">
                  <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Article Content (HTML)</label>
                  <textarea v-model="ls.content" rows="5" class="input text-xs resize-y font-mono" placeholder="<h2>Section 1</h2><p>Content here…</p>" />
                </div>
                <!-- Assignment -->
                <div v-if="ls.type === 'assignment'">
                  <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Assignment Instructions</label>
                  <textarea v-model="ls.content" rows="4" class="input text-xs resize-y" placeholder="Describe the assignment task…" />
                </div>
                <!-- Quiz Builder -->
                <div v-if="ls.type === 'quiz'">
                  <div class="flex items-center justify-between mb-3">
                    <label class="text-xs font-bold text-gray-500 uppercase">Quiz Questions</label>
                    <button @click="addQuestion(ls)" class="text-xs text-primary hover:underline">+ Add Question</button>
                  </div>
                  <div v-for="(q, qi) in ls.quiz_questions || []" :key="qi" class="bg-white dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 mb-3">
                    <div class="flex items-start gap-2 mb-3">
                      <span class="text-xs font-bold text-gray-400 w-5 shrink-0 mt-2">Q{{ qi + 1 }}</span>
                      <div class="flex-1 space-y-2">
                        <textarea v-model="q.text" rows="2" class="input text-xs resize-none" placeholder="Question text…" />
                        <div class="flex gap-2">
                          <select v-model="q.type" @change="q.options = q.type === 'truefalse' ? [] : (q.options || ['',''])" class="text-xs border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 bg-white dark:bg-surface-900 outline-none">
                            <option value="mcq">Single Choice</option>
                            <option value="multi">Multi Select</option>
                            <option value="truefalse">True / False</option>
                            <option value="short">Short Answer</option>
                          </select>
                          <input v-model.number="q.points" type="number" min="1" class="w-16 text-xs input" placeholder="Pts" />
                        </div>
                        <!-- Options -->
                        <div v-if="q.type === 'mcq' || q.type === 'multi'">
                          <div v-for="(opt, oi) in q.options || []" :key="oi" class="flex items-center gap-2 mb-1.5">
                            <input v-if="q.type === 'mcq'" type="radio" :name="`ans-${mi}-${li}-${qi}`" :value="opt" v-model="q.correct_answer" class="accent-primary shrink-0" />
                            <input v-else type="checkbox" :value="opt" :checked="Array.isArray(q.correct_answer) && q.correct_answer.includes(opt)"
                              @change="toggleCorrectMulti(q, opt)" class="accent-primary shrink-0" />
                            <input v-model="q.options[oi]" class="flex-1 text-xs input py-1" :placeholder="`Option ${oi + 1}…`" />
                            <button @click="q.options.splice(oi, 1)" class="text-gray-400 hover:text-danger text-sm">×</button>
                          </div>
                          <button @click="q.options.push('')" class="text-xs text-primary hover:underline mt-1">+ Add option</button>
                          <p class="text-xs text-gray-400 mt-1">{{ q.type === 'mcq' ? 'Select the correct answer above.' : 'Check all correct answers.' }}</p>
                        </div>
                        <div v-else-if="q.type === 'truefalse'">
                          <div class="flex gap-4">
                            <label class="flex items-center gap-2 text-sm"><input type="radio" value="True" v-model="q.correct_answer" class="accent-primary" /> True</label>
                            <label class="flex items-center gap-2 text-sm"><input type="radio" value="False" v-model="q.correct_answer" class="accent-primary" /> False</label>
                          </div>
                        </div>
                        <div v-else-if="q.type === 'short'">
                          <input v-model="q.correct_answer" class="input text-xs" placeholder="Expected answer (used for grading)" />
                        </div>
                        <div>
                          <input v-model="q.explanation" class="input text-xs" placeholder="Explanation shown after answering (optional)" />
                        </div>
                      </div>
                      <button @click="ls.quiz_questions.splice(qi, 1)" class="text-gray-400 hover:text-danger text-lg shrink-0">×</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button @click="addLesson(mi)" class="w-full text-xs text-primary border border-primary/20 rounded-xl py-2 hover:bg-primary/5 transition-colors">+ Add Lesson</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCourseStore } from '../../stores/course'
import type { Course, Module, Lesson, QuizQuestion } from '../../stores/course'

const courseStore = useCourseStore()
const courses = computed(() => courseStore.courses)
const view = ref<'list' | 'edit'>('list')
const saving = ref(false)
const error = ref('')
const expandedLesson = ref<string | null>(null)

const blankForm = (): Partial<Course> & { modules: Module[] } => ({
  title: '', description: '', instructor: '', category: '', level: 'Beginner',
  duration: '', price: 'Free', thumbnail: '', modules: [],
})
const form = ref<any>(blankForm())

function newCourse() { form.value = blankForm(); view.value = 'edit'; error.value = '' }
function editCourse(c: Course) { form.value = JSON.parse(JSON.stringify(c)); if (!form.value.modules) form.value.modules = []; view.value = 'edit'; error.value = '' }

async function del(id: any) {
  if (!confirm('Delete this course? This cannot be undone.')) return
  try { await courseStore.adminDeleteCourse(id) } catch (e: any) { error.value = e.message }
}
async function save() {
  if (!form.value.title?.trim()) { error.value = 'Course title is required.'; return }
  saving.value = true; error.value = ''
  try { await courseStore.adminSaveCourse(form.value); view.value = 'list' }
  catch (e: any) { error.value = e.message }
  finally { saving.value = false }
}

function addModule() {
  form.value.modules.push({ module_id: `m_${Date.now()}`, title: '', order: form.value.modules.length, lessons: [] })
}
function removeModule(i: number) { form.value.modules.splice(i, 1) }
function addLesson(mi: number) {
  const lesson: Lesson = { lesson_id: `l_${Date.now()}`, title: '', type: 'video', duration: '10m', order: form.value.modules[mi].lessons.length, video_url: '', content: '', quiz_questions: [] }
  form.value.modules[mi].lessons.push(lesson)
  expandedLesson.value = `${mi}-${form.value.modules[mi].lessons.length - 1}`
}
function removeLesson(mi: number, li: number) { form.value.modules[mi].lessons.splice(li, 1); expandedLesson.value = null }
function toggleLesson(mi: number, li: number) {
  const key = `${mi}-${li}`
  expandedLesson.value = expandedLesson.value === key ? null : key
}
function onTypeChange(ls: Lesson) { if (ls.type === 'quiz' && !ls.quiz_questions) ls.quiz_questions = [] }

function addQuestion(ls: Lesson) {
  if (!ls.quiz_questions) ls.quiz_questions = []
  ls.quiz_questions.push({ id: `q_${Date.now()}`, type: 'mcq', text: '', options: ['', ''], correct_answer: '', explanation: '', points: 1 })
}
function toggleCorrectMulti(q: QuizQuestion, opt: string) {
  if (!Array.isArray(q.correct_answer)) q.correct_answer = []
  const arr = q.correct_answer as string[]
  const i = arr.indexOf(opt)
  if (i >= 0) arr.splice(i, 1); else arr.push(opt)
}
</script>
